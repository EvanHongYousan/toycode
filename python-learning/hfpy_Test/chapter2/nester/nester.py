__author__ = 'yantianyu'


def print_lol(the_list, level):
    for each in the_list:
        if isinstance(each, list):
            print_lol(each, level + 1)
        else:
            for i in range(level):
                print('\t'),
            print(each)
